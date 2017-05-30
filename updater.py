#!/usr/bin/env python
__author__ = 'keith@point.org.nz'

# Grab summaries from wikipedia
# Grabs bilateral summary export/import data and total export/import data by HS07 categories from atlas.media.mit.edu/api/

import re
import urllib2
import json
import psycopg2
import datetime

DB   = "dbname='pacpeer' user='web'"
YEAR = "all"

#########################
#                       #
#  Countries summaries  #
#                       #
#########################
def fetch_summary(a3, name):
  print "Fetching summary data for " + a3 + "..."

  # Get request
  title = re.sub("\s", "%20", name)
  url = ("https://en.wikipedia.org/w/api.php?"
         "action=query&prop=extracts&format=json&exintro=&"
         "titles=" + title)
  req = urllib2.Request(url)
  res = urllib2.urlopen(req)
  obj = json.loads(res.read())

  # Check result
  pages = obj["query"]["pages"]
  if "-1" in pages:
    print "ERROR! Could not fetch summary page for " + a3 + "!"

  # Return the first page
  else:
    for p in pages:
      extract = pages[p]["extract"]
      if not extract:
        print "ERROR! No content for " + a3 + "!"
      else:
        return {
          "name" : name,
          "a3"   : a3,
          "url"  : url,
          "text" : extract.encode('utf-8')
        }


def store_summary(a3, url, text):
  date = datetime.datetime.now()
  print "Storing summary data for " + a3 + "..."

  cur.execute("SELECT * FROM summaries WHERE a3=%s", [a3])
  # Update
  if cur.rowcount:
    cur.execute("UPDATE summaries SET text=%s,lastupdate=%s WHERE a3=%s", [text, date, a3])
    if cur.rowcount: print "UPDATE successful."

  # Insert
  else:
    cur.execute("INSERT INTO summaries VALUES (%s,%s,%s,%s)", [a3, url, text, date])
    if cur.rowcount: print "INSERT successful."

  # Error!
  if not cur.rowcount:
    print "ERROR! Could not insert or update!"
    print url
    print text


##############################
#                            #
#  Export data by countries  #
#                            #
##############################
def fetch_trade_countries(a3, year):
  print "Fetching trade countries data for " + a3 + "..."

  # Get request
  url = "http://atlas.media.mit.edu/hs07/all/" + year + "/" + a3 + "/show/all/"
  try:
    req = urllib2.Request(url)
    res = urllib2.urlopen(req)
    obj = json.loads(res.read())
  except urllib2.HTTPError:
    print "ERROR! Could not get data for " + a3 + "!"
    return []

  # Check result
  data = obj["data"]
  if not data:
    print "ERROR! No data for " + a3 + "!"
    return []
  else:
    return data


def store_trade_countries(a3, data, year):
  print "Storing trade countries data for " + a3 + " in " + str(year) + "..."
  added     = 0
  duplicate = 0

  for d in data:
    if "export_val" in d:
      orig = d["origin_id"][2:]
      dest = d["dest_id"][2:]
      year = d["year"]
      val  = d["export_val"]

      # Check whether row already exists
      cur.execute("SELECT * FROM trade_countries WHERE orig=%s AND dest=%s and year=%s", [orig, dest, year])
      if cur.rowcount: duplicate += 1

      # Insert
      else:
        cur.execute("INSERT INTO trade_countries VALUES (%s,%s,%s,%s)", [orig, dest, year, val])
        if cur.rowcount: added += 1
        else:
          print "ERROR! Could not INSERT!"
          print d
          raise

    # Store imports as exports going the other way
    if "import_val" in d:
      orig = d["dest_id"][2:]
      dest = d["origin_id"][2:]
      year = d["year"]
      val  = d["import_val"]

      # Check whether row already exists
      cur.execute("SELECT * FROM trade_countries WHERE orig=%s AND dest=%s and year=%s", [orig, dest, year])
      if cur.rowcount: duplicate += 1

      # Insert
      else:
        cur.execute("INSERT INTO trade_countries VALUES (%s,%s,%s,%s)", [orig, dest, year, val])
        if cur.rowcount: added += 1
        else:
          print "ERROR! Could not INSERT!"
          print d
          raise

  if duplicate:
    print str(added) + " INSERTED, " + str(duplicate) + " already existed."
  else:
    print str(added) + " INSERTED."


################################
#                              #
#  Export data by commodities  #
#                              #
################################
def fetch_trade_commodities(a3, year):
  print "Fetching trade commodities data for " + a3 + "..."

  # Get request
  url = "http://atlas.media.mit.edu/hs07/all/" + year + "/" + a3 + "/all/show/"
  try:
    req = urllib2.Request(url)
    res = urllib2.urlopen(req)
    obj = json.loads(res.read())
  except urllib2.HTTPError:
    print "ERROR! Could not get data for " + a3 + "!"
    return []

  # Check result
  data = obj["data"]
  if not data:
    print "ERROR! No data for " + a3 + "!"
    return []
  else:
    return data


def store_trade_commodities(a3, data, year):
  print "Storing trade commodities data for " + a3 + " in " + str(year) + "..."
  added     = 0
  duplicate = 0

  for d in data:
    hsid = d["hs07_id"]
    # Only added level 3 data (eg. 010101)
    if len(hsid.strip()) != 6: None

    # Only add if it has valid import or export data
    elif "export_val" in d or "import_val" in d:
      orig = d["origin_id"][2:]
      year = d["year"]

      if "export_val" in d:
        export_val = d["export_val"]
        export_rca = d["export_rca"]
      else:
        export_val = None
        export_rca = None

      if "import_val" in d:
        import_val = d["import_val"]
        import_rca = d["import_rca"]
      else:
        import_val = None
        import_rca = None

      cur.execute("SELECT * FROM trade_commodities WHERE orig=%s AND hs07_id=%s AND year=%s", [orig, hsid, year])
      if cur.rowcount: duplicate += 1

      # Insert
      else:
        cur.execute(
          "INSERT INTO trade_commodities VALUES (%s,%s,%s,%s,%s,%s,%s)",
          [orig, hsid, year, export_val, export_rca, import_val, import_rca])
        if cur.rowcount: added += 1
        else:
          print "ERROR! Could not INSERT!"
          print d
          raise

  if duplicate:
    print str(added) + " INSERTED, " + str(duplicate) + " already existed."
  else:
    print str(added) + " INSERTED."


db  = psycopg2.connect(DB)
cur = db.cursor()
cur.execute("SELECT * FROM countries")

# country = ["Guernsey", "GG", "GGY"]
# data = fetch_trade(country, YEAR)
# if len(data): store_trade(country, data, YEAR)

for country in cur.fetchall():
  a3   = country[3] # 3-letter country code
  name = country[1] # Country name
  print
  print "--- " + name + " (" + a3 + ") ---"

  # Wikipedia summary
  d = fetch_summary(a3, name)
  if d and d["text"]: store_summary(a3, d["url"], d["text"])

  # Export data by destination
  data = fetch_trade_countries(a3, YEAR)
  if len(data): store_trade_countries(a3, data, YEAR)

  # Import/export data by commodity type
  data = fetch_trade_commodities(a3, YEAR)
  if len(data): store_trade_commodities(a3, data, YEAR)

  # Write to database after every country
  db.commit()
  print

db.close()
