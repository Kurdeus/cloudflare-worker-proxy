# Cloudflare Proxy Service

A lightweight, fast CORS proxy service built for Cloudflare Workers that enables cross-origin requests to any website by bypassing CORS restrictions.

## Features

- 🚀 **Fast & Lightweight**: Built on Cloudflare Workers edge network
- 🌐 **Universal CORS Support**: Enables cross-origin requests to any domain
- 🔄 **Automatic Redirects**: Handles up to 5 redirects automatically
- 🍪 **Cookie Support**: Proper cookie handling with `X-Cookie` header mapping
- 🛡️ **Security Headers**: Removes unsafe headers and adds proper CORS headers
- 📱 **All HTTP Methods**: Supports GET, POST, PUT, DELETE, OPTIONS, and more
- 🔗 **Query Parameter Support**: Preserves and forwards query parameters

## Usage

### Basic Syntax

```
https://your-worker-domain.com/target-domain.com/path
```

### Examples

#### GET Request
```bash
curl "https://your-proxy.workers.dev/api.github.com/users/octocat"
```

#### POST Request with JSON
```bash
curl -X POST "https://your-proxy.workers.dev/httpbin.org/post" \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

#### With Custom Headers
```bash
curl "https://your-proxy.workers.dev/api.example.com/data" \
  -H "Authorization: Bearer your-token" \
  -H "User-Agent: MyApp/1.0"
```

#### With Cookies
```bash
curl "https://your-proxy.workers.dev/example.com/protected" \
  -H "X-Cookie: session=abc123; user=john"
```

#### Full URLs
```bash
curl "https://your-proxy.workers.dev/https://api.example.com/v1/data"
```

## JavaScript/Browser Usage

```javascript
// Simple GET request
fetch('https://your-proxy.workers.dev/api.github.com/users/octocat')
  .then(response => response.json())
  .then(data => console.log(data));

// POST request with JSON
fetch('https://your-proxy.workers.dev/httpbin.org/post', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token'
  },
  body: JSON.stringify({ message: 'Hello World' })
})
.then(response => response.json())
.then(data => console.log(data));

// Request with cookies
fetch('https://your-proxy.workers.dev/example.com/api', {
  headers: {
    'X-Cookie': 'session=abc123; user=john'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

## Python Testing Example

```python
import requests
import json

# Your proxy URL
PROXY_URL = "https://your-proxy.workers.dev"

def test_get_request():
    """Test GET request through proxy"""
    response = requests.get(f"{PROXY_URL}/httpbin.org/get")
    print("GET Response:", response.json())

def test_post_request():
    """Test POST request with JSON data"""
    data = {
        "name": "John Doe",
        "email": "john@example.com",
        "message": "Hello from Python!"
    }
    
    response = requests.post(
        f"{PROXY_URL}/httpbin.org/post",
        json=data,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "Python Test Client"
        }
    )
    
    print("POST Response:", response.json())

def test_with_cookies():
    """Test request with cookies"""
    response = requests.get(
        f"{PROXY_URL}/httpbin.org/cookies",
        headers={
            "X-Cookie": "session=abc123; user=testuser"
        }
    )
    
    print("Cookie Response:", response.json())

def test_with_auth():
    """Test request with authorization header"""
    response = requests.get(
        f"{PROXY_URL}/httpbin.org/bearer",
        headers={
            "Authorization": "Bearer your-secret-token"
        }
    )
    
    print("Auth Response:", response.json())

if __name__ == "__main__":
    test_get_request()
    test_post_request()
    test_with_cookies()
    test_with_auth()
```

## Special Headers

| Header | Description |
|--------|-------------|
| `X-Cookie` | Maps to `Cookie` header for the target request |
| `X-Set-Cookie` | Contains `Set-Cookie` from target response |


## Limitations

- **Redirect Limit**: Maximum 5 redirects to prevent infinite loops
- **Protocol Support**: Only HTTP and HTTPS protocols
- **Size Limits**: Subject to Cloudflare Workers limits (1MB request/response)
- **Execution Time**: 30-second timeout for requests

## Security Considerations

- This proxy removes security headers that might interfere with CORS
- All requests are logged by Cloudflare (standard practice)
- Consider rate limiting for production use
- Be aware of potential abuse when deployed publicly

## Error Responses

| Status | Message | Description |
|--------|---------|-------------|
| 400 | `URL path required` | No target URL provided |
| 400 | `Invalid protocol` | Non-HTTP/HTTPS protocol used |
| 418 | `Too many redirects` | Exceeded redirect limit |
| 500 | `Error: {message}` | General server error |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check Cloudflare Workers documentation
- Review the code comments for implementation details