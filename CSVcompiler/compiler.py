# compiler.py, by Pirjot Atwal

try:
    import csv
    import sys
    import re
    import json
    print("Compiler Running...")
except Exception as e:
    print("ERROR")

"""
We assume that the class name is in the REGEX form of 
r'[A-Z]+\-\d+\w* '. Thus, everything from a class name to a class name
is determined to be a class' information. 
"""

# The raw CSV may store class information as being in the second
# column, so we first convert the CSV into a one column data set
# where for any extra columns, they are simply added into the
# first column with a space appended in between the concatenation.

data = []
filename = 'data.csv'
outfilename = 'data.json'
if len(sys.argv) > 1:
    filename = sys.argv[1]
if len(sys.argv) > 2:
    outfilename = sys.argv[2]


with open(filename, newline='') as csvfile:
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
    #Convert data into being equal to the first value of every row.
    for i in range(len(data)):
        data[i] = data[i][0]

# Discard all information at the start until the first class
class_pattern = re.compile(r'[A-Z]+\-\d+\w* ')

def next_regex(data, regex, start = True):
    '''
    Given an array of strings, finds the index of the first
    string in the array which has atleast one matching regex solution.

    Parameters
    ----------
    data : list
        A list of strings
    second : Pattern[AnyStr@compile]
        A compiled regex to search
    start : bool
        If the Regex must occur at the start of the string

    Returns
    -------
    Integer
        The index of the regex, -1 if not found
    '''
    for i in range(len(data)):
        line = data[i]
        matches = regex.finditer(line)
        matches_list = list(matches)
        #This line has a class in it
        if len(matches_list) > 0: 
            #The class is at the start
            if not start or matches_list[0].group(0) == line[0: len(matches_list[0].group(0))]:
                return i
    return -1

orig_data = data
data = data[next_regex(data, class_pattern):]
# An array of dictionaries
mapped_data = []


while len(data) > 0:
    # print("CLASS " + data[0])
    # print("HOURS " + data[1])
    # print("UNITS " + data[2])
    new_class = {}
    new_class["CLASS"] = data[0]
    new_class["HOURS"] = data[1]
    new_class["UNITS"] = data[2]
    
    next_index = next_regex(data[1:], class_pattern) + 1

    #Make sure that the "Units: X units" Line exists after the next_index
    while len(data) >= next_index + 2 and "Units" not in data[next_index + 2]:
        next_index = next_regex(data[next_index + 1:], class_pattern) + next_index + 1

    misc = ""

    # The rest of the information of the class goes until the line with a (GR) or (CR)
    gr_cr_regex = re.compile(r'\(GR\)|\(CR\)|\(GC\)|\(NG\)')
    gr_cr_index = next_regex(data[1:], gr_cr_regex, False) + 1

    for i in range(3, min(gr_cr_index + 1, len(data))):
        if i != 0:
            misc += " "
        misc += data[i]
    # print("MISC " + misc)
    new_class["MISC"] = misc

    mapped_data.append(new_class)

    if next_index == 0:
        break
    data = data[next_index :]



# Save data to data.json
with open(outfilename, "w") as outfile:
    json.dump(mapped_data, outfile)
