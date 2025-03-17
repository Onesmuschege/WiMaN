import logging
from utils.db import get_db_connection

def expired_subscriptions():
    """Marks expired subscriptions as 'expired' and updates start/end dates for active ones."""
    try:
        db = get_db_connection()
        if not db:
            logging.error("Database connection failed")
            return {'error': 'Database connection failed'}

        with db.cursor() as cursor:
            # Log when the function starts
            logging.info("Running expired_subscriptions job...")

            # Mark expired subscriptions
            expire_query = """
                UPDATE subscriptions 
                SET status = 'expired' 
                WHERE end_date < NOW() 
                AND (status IS NULL OR status = 'pending');
            """
            cursor.execute(expire_query)
            expired_count = cursor.rowcount  # Get affected rows

            # Update start_at and expires_at for active subscriptions
            update_dates_query = """
                UPDATE users_subscriptions 
                SET start_at = NOW(), 
                    expires_at = DATE_ADD(NOW(), INTERVAL duration_days DAY) 
                WHERE status = 'active' 
                AND (start_at IS NULL OR expires_at IS NULL);
            """
            cursor.execute(update_dates_query)
            updated_count = cursor.rowcount  # Get affected rows

            db.commit()

        logging.info(f"Subscriptions expired: {expired_count}, Dates updated: {updated_count}")
        return {'message': f"{expired_count} subscriptions expired, {updated_count} updated"}
        
    except Exception as e:
        logging.error(f"Error in expired_subscriptions: {e}")
        return {'error': str(e)}
    finally:
        if db:
            db.close()
