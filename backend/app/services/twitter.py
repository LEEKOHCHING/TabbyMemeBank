"""Twitter/X API service for Sophia's market research."""
import tweepy
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()


def get_twitter_client():
    """Get authenticated Twitter client."""
    try:
        client = tweepy.Client(
            bearer_token=settings.twitter_bearer_token,
            consumer_key=settings.twitter_api_key,
            consumer_secret=settings.twitter_api_secret,
            access_token=settings.twitter_access_token,
            access_token_secret=settings.twitter_access_token_secret,
        )
        return client
    except Exception as e:
        logger.error(f"Twitter client error: {e}")
        return None


def search_token_tweets(token_symbol: str, max_results: int = 10) -> list[dict]:
    """Search recent tweets about a Meme token."""
    client = get_twitter_client()
    if not client:
        return []

    try:
        query = f"#{token_symbol} OR ${token_symbol} BSC meme -is:retweet lang:en"
        tweets = client.search_recent_tweets(
            query=query,
            max_results=min(max_results, 100),
            tweet_fields=["created_at", "author_id", "public_metrics"],
        )
        if not tweets.data:
            return []

        return [
            {
                "id": str(t.id),
                "text": t.text,
                "created_at": str(t.created_at),
                "likes": t.public_metrics.get("like_count", 0) if t.public_metrics else 0,
                "retweets": t.public_metrics.get("retweet_count", 0) if t.public_metrics else 0,
            }
            for t in tweets.data
        ]
    except Exception as e:
        logger.error(f"Twitter search error for {token_symbol}: {e}")
        return []


def get_kol_tweets(max_results: int = 20) -> list[dict]:
    """Get recent tweets from KOL list."""
    client = get_twitter_client()
    if not client or not settings.twitter_kol_list:
        return []

    kols = settings.twitter_kol_list.split(",")
    all_tweets = []

    for kol in kols[:5]:  # Limit to 5 KOLs to avoid rate limits
        try:
            # Get user by username
            user = client.get_user(username=kol.strip())
            if not user.data:
                continue

            tweets = client.get_users_tweets(
                id=user.data.id,
                max_results=min(max_results // len(kols), 10),
                tweet_fields=["created_at", "public_metrics"],
                exclude=["retweets"],
            )
            if tweets.data:
                for t in tweets.data:
                    all_tweets.append({
                        "kol": kol.strip(),
                        "id": str(t.id),
                        "text": t.text,
                        "created_at": str(t.created_at),
                        "likes": t.public_metrics.get("like_count", 0) if t.public_metrics else 0,
                    })
        except Exception as e:
            logger.error(f"Error fetching tweets for KOL {kol}: {e}")
            continue

    return all_tweets
