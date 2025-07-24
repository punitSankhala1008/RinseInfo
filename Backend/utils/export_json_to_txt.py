import os
from datetime import datetime

def export_json_to_txt(data):
    # Create a readable text from the JSON
    lines = []
    for key, value in data.items():
        lines.append(f"{key}: {value if value else 'N/A'}")

    content = "\n".join(lines)

    # Create 'exports' directory if it doesn't exist
    export_dir = os.path.join(os.getcwd(), "exports")
    os.makedirs(export_dir, exist_ok=True)

    # Save to a timestamped txt file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filepath = os.path.join(export_dir, f"extracted_{timestamp}.txt")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

    return filepath
