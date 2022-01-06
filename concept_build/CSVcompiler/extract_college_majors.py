# extract_college_majors.py by Pirjot Atwal

try:
    import csv
    import sys
    import re
    import json
    print("Extraction Running...")
except Exception as e:
    print("ERROR")

data = []
colleges_list = 'colleges-list.csv'
majors_list = 'majors-list.csv'
outfilename = 'major_colleges.json'
if len(sys.argv) > 1:
    colleges_list = sys.argv[1]
if len(sys.argv) > 2:
    majors_list = sys.argv[2]
if len(sys.argv) > 3:
    outfilename = sys.argv[2]

with open(colleges_list, newline='') as csvfile:
    reader = csv.reader(csvfile)
    # Add every row into the data
    for row in reader:
        data.append(row)
    # Combine all of the columns in every row into the first column
    for i in range(len(data)):
        for rowindex in range(len(data[i])):
            if rowindex != 0:
                if len(data[i][0]) != 0: # and len(data[i][rowindex]) > 0
                    data[i][0] += " "
                data[i][0] += data[i][rowindex]
    # Convert data into being equal to the first value of every row.
    for i in range(len(data)):
        data[i] = data[i][0]

i = 0
while i < len(data):
    j = 0
    while j < len(data[i]):
        if (data[i][j] == '\r'):
            data[i] = data[i][:j] + " " + data[i][j+1:]
        else:
            j += 1
    if (data[i] == ''):
        data.pop(i)
    else:
        i += 1

universities = data
data = {}
majors = {}

with open(majors_list, newline='') as csvfile:
    reader = csv.reader(csvfile)
    for row in reader:
        if row[2] in majors:
            majors[row[2]].append(row[1])
        else:
            majors[row[2]] = [row[1]]

data["UNIVERSITIES"] = universities
data["MAJORS"] = majors

# Save data to data.json
with open(outfilename, "w") as outfile:
    json.dump(data, outfile)
