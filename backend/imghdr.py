# Python 3.13 compatibility shim for 'imghdr' (removed from stdlib)
# tweepy still depends on it — this stub satisfies the import without breaking anything.

def what(file, h=None):
    """Detect image type. Returns None (sufficient for tweepy's API v1 usage)."""
    return None
