import logging
import os
import datetime
import logging
# LOGGING_LOCATION = "D:" + '/logs/'

LOGGING_LOCATION = os.environ['HOME'] + '/logs/'

if not os.path.exists(LOGGING_LOCATION):
    try:
        os.makedirs(LOGGING_LOCATION)
    except Exception as e:
        print(e)


LOG_FILE_NAME = str(datetime.datetime.now()).replace('-', '').replace(':', '').replace(' ', '').split('.')[0] + '.log'


def create_logger(_app_name):
    logger_level_param = logging.INFO
    _logging_location=LOGGING_LOCATION
    logger = logging.getLogger(_app_name)
    _logfile = _logging_location + _app_name + '_' + LOG_FILE_NAME
    logger = logging.getLogger(_app_name)
    logger.setLevel(logger_level_param)
    fh = logging.FileHandler(_logfile)
    fh.setLevel(logger_level_param)
    ch = logging.StreamHandler()
    ch.setLevel(logger_level_param)
    formatter = logging.Formatter(
        "%(asctime)s - [%(filename)s - %(funcName)10s():%(lineno)s ] - %(levelname)s - %(message)s",
        datefmt='%Y-%m-%d %H:%M:%S')
    ch.setFormatter(formatter)
    fh.setFormatter(formatter)
    logger.addHandler(ch)
    logger.addHandler(fh)
    return logger
