# Security Setup Guide

This guide explains how to securely configure environment variables for the Django application.

## Environment Variables Setup

### 1. Install Dependencies

Make sure you have `python-dotenv` installed:

```bash
pip install -r requirements.txt
```

### 2. Create Your Environment File

Copy the example environment file and customize it:

```bash
cp .env.example .env
```

### 3. Configure Your Environment Variables

Edit the `.env` file with your actual values:

```env
# Django Secret Key - Generate a new one for production
SECRET_KEY=your-secret-key-here

# Debug Mode (set to False in production)
DEBUG=True

# GitHub OAuth Credentials - Get these from GitHub Developer Settings
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Allowed Hosts (comma-separated for multiple hosts)
ALLOWED_HOSTS=localhost,127.0.0.1
```

### 4. Generate a New Secret Key

For production, generate a new Django secret key:

```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

Or use this online generator: https://djecrety.ir/

### 5. GitHub OAuth Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App
3. Set the Authorization callback URL to: `http://localhost:8000/accounts/github/login/callback/`
4. Copy the Client ID and Client Secret to your `.env` file

## Security Best Practices

### Environment Variables

- **Never commit `.env` files** to version control
- Use different `.env` files for different environments (development, staging, production)
- Keep sensitive credentials in environment variables, not in code
- Use strong, unique secret keys for each environment

### Production Deployment

For production deployment:

1. Set `DEBUG=False` in your `.env` file
2. Configure proper `ALLOWED_HOSTS` (remove `*` wildcard)
3. Use environment variables provided by your hosting platform
4. Enable HTTPS and set secure cookie settings

### File Security

The following files are automatically ignored by Git (see `.gitignore`):

- `.env` - Contains sensitive environment variables
- `db.sqlite3` - Local database file
- `__pycache__/` - Python cache files

## Environment Variables Reference

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `SECRET_KEY` | Django secret key for cryptographic signing | `django-insecure-...` | Yes |
| `DEBUG` | Enable/disable debug mode | `True` or `False` | Yes |
| `ALLOWED_HOSTS` | Comma-separated list of allowed hosts | `localhost,127.0.0.1` | Yes |
| `GITHUB_CLIENT_ID` | GitHub OAuth application client ID | `Ov23li...` | Yes* |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth application secret | `3281a84...` | Yes* |

*Required for GitHub OAuth functionality

## Troubleshooting

### Common Issues

1. **ImportError: No module named 'dotenv'**
   - Solution: Install python-dotenv with `pip install python-dotenv`

2. **Environment variables not loading**
   - Check that `.env` file is in the project root directory
   - Verify the file format (no spaces around `=`)
   - Ensure `load_dotenv()` is called before accessing environment variables

3. **GitHub OAuth not working**
   - Verify your GitHub OAuth app settings
   - Check that callback URL matches your application URL
   - Ensure CLIENT_ID and CLIENT_SECRET are correct

### Testing Configuration

Test that your environment variables are loaded correctly:

```bash
python manage.py check
```

## Migration from Hardcoded Values

If you're migrating from hardcoded values:

1. ✅ Move `SECRET_KEY` to `.env` file
2. ✅ Move `DEBUG` setting to `.env` file  
3. ✅ Move GitHub OAuth credentials to `.env` file
4. ✅ Configure `ALLOWED_HOSTS` via environment variable
5. ✅ Add `.env` to `.gitignore` (already done)
6. ✅ Create `.env.example` template file
7. ✅ Update `settings.py` to use `os.getenv()`
8. ✅ Install and configure `python-dotenv`

## Additional Security Considerations

- Consider using a secrets management service for production
- Regularly rotate your secret keys and OAuth credentials
- Monitor your application for security vulnerabilities
- Keep your dependencies up to date
- Use HTTPS in production
- Configure proper CORS settings if needed