import base64
import json
import re
import zipfile

# Read the HTML file
html_file_path = (
    'd:\\Nuxt Projects\\new-portfolio\\playwright-report\\index.html'
)
with open(html_file_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

# Extract the base64 string
match = re.search(r'data:application/zip;base64,([^"]*)', html_content)
if not match:
    print("Base64 not found")
    exit(1)

base64_data = match.group(1)

# Decode base64
zip_data = base64.b64decode(base64_data)

# Write to a temporary zip file
with open('temp.zip', 'wb') as f:
    f.write(zip_data)

# Extract report.json
with zipfile.ZipFile('temp.zip', 'r') as zip_ref:
    with zip_ref.open('report.json') as f:
        report_data = json.load(f)

# Print the report
print(json.dumps(report_data, indent=2))
