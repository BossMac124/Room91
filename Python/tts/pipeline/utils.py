from datetime import datetime, timedelta
import re

def parse_time_diff(time_str):
    patterns = {
        "시간": r"(\d+)\s*시간",
        "일": r"(\d+)\s*일",
        "분": r"(\d+)\s*분",
        "주": r"(\d+)\s*주"
    }
    now = datetime.now()
    if isinstance(time_str, str):
        for key, pattern in patterns.items():
            if key in time_str:
                match = re.search(pattern, time_str)
                if match:
                    value = int(match.group(1))
                    if key == "시간": return now - timedelta(hours=value)
                    if key == "일": return now - timedelta(days=value)
                    if key == "분": return now - timedelta(minutes=value)
                    if key == "주": return now - timedelta(weeks=value)
    return now
