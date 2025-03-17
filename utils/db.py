import configparser
import MySQLdb

REQUIRED_KEYS = ['host', 'user', 'password', 'database', 'autocommit']

def get_db_connection():
    config = configparser.ConfigParser()
    config.read('config.ini')
    db_config = config['database']
    
    missing_keys = [key for key in REQUIRED_KEYS if key not in db_config]
    if missing_keys:
        raise ValueError(f"Missing configuration keys: {', '.join(missing_keys)}")
    
    autocommit = db_config.getboolean('autocommit', True)
    
    return MySQLdb.connect(
        host=db_config['host'],
        user=db_config['user'],
        password=db_config['password'],
        database=db_config['database'],
        autocommit=autocommit
    )
