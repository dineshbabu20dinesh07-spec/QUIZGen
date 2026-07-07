import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

def get_mysql_connection():
    try:
        # First connect without database to create it if it doesn't exist
        init_conn = mysql.connector.connect(
            host=os.environ.get("MYSQL_HOST", "127.0.0.1"),
            port=int(os.environ.get("MYSQL_PORT", 3306)),
            user=os.environ.get("MYSQL_USER", "root"),
            password=os.environ.get("MYSQL_PASSWORD", "Susammu04@")
        )
        if init_conn.is_connected():
            cursor = init_conn.cursor()
            db_name = os.environ.get("MYSQL_DATABASE", "panraa")
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
            cursor.close()
            init_conn.close()

        # Now connect with the database
        connection = mysql.connector.connect(
            host=os.environ.get("MYSQL_HOST", "127.0.0.1"),
            port=int(os.environ.get("MYSQL_PORT", 3306)),
            user=os.environ.get("MYSQL_USER", "root"),
            password=os.environ.get("MYSQL_PASSWORD", "Susammu04@"),
            database=os.environ.get("MYSQL_DATABASE", "panraa")
        )
        if connection.is_connected():
            print("[OK] MySQL Connected Successfully to 'panraa' database!")
            return connection
    except mysql.connector.Error as e:
        print(f"[WARN] Error connecting to MySQL: {e}")
        return None

if __name__ == "__main__":
    conn = get_mysql_connection()
    if conn:
        conn.close()
