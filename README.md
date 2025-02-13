# White Paper

## Description

White Paper is a web application developed using the Python Django framework. This project serves as a digital notepad, allowing users to create, edit, and manage notes efficiently. It emphasizes simplicity, scalability, and an intuitive user experience for seamless note-taking.

---

## Tech Stack

- **Backend**: Python, Django Framework  
- **Frontend**: HTML, CSS, JavaScript  
- **Database**: SQLite (default), with options for PostgreSQL/MySQL  
- **Others**: Django Rest Framework (if applicable), Bootstrap (if applicable)  

---

## Overview

### Signup page

<img width="947" alt="image" src="https://github.com/user-attachments/assets/4a96887b-49a6-4e66-8be7-1f1563d9ef00" />

### Login Page

<img width="701" alt="image" src="https://github.com/user-attachments/assets/b49a9f2b-3443-4b65-a98e-a71fdb623e1e" />

### Home Page

<img width="889" alt="image" src="https://github.com/user-attachments/assets/bc1ba22f-f8a5-4dc6-86fa-276add534e6f" />

### Create a new note

<img width="946" alt="image" src="https://github.com/user-attachments/assets/9560d03a-2f31-4364-b4ef-d4fe24ac1565" />

### Forget Password

<img width="960" alt="image" src="https://github.com/user-attachments/assets/8dae874d-0db6-4bb6-8c09-70049e761990" />

## Installation

### Prerequisites

1. Python 3.8+ installed on your system.  
2. Virtual Environment tools such as `venv` or `virtualenv`.  
3. SQLite (default) or a preferred database like PostgreSQL/MySQL (optional).

### Steps to Install and Run Locally

1. **Clone the repository**:  
   ```bash
   git clone https://github.com/ygowthamr/WhitePaper.git
   cd WhitePaper
   ```

2. **Set up a virtual environment**:  
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:  
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure the database**:  
   - For the default SQLite database:  
     No additional configuration is required.  
   - For PostgreSQL/MySQL, update the `DATABASES` settings in `settings.py`.  

5. **Apply migrations**:  
   ```bash
   python manage.py migrate
   ```

6. **Run the development server**:  
   ```bash
   python manage.py runserver
   ```

7. **Access the application**:  
   Open your browser and navigate to `http://127.0.0.1:8000`.

---

## Setting Up GitHub OAuth Login

### Step 1: Create a Superuser
Run this command in the terminal:
```sh
python manage.py createsuperuser
```
Enter **username, email, and password** when prompted.

### Step 2: Apply Migrations and Start the Server
```sh
python manage.py migrate  
python manage.py runserver
```

### Step 3: Access Django Admin
1. Open **[127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)**.
2. Log in with the **superuser credentials** you just created.

### Step 4: Configure Sites
1. Click **Sites → Add Site**.
2. Enter:
   - **Domain Name:** `127.0.0.1:8000`
   - **Display Name:** `WhitePaper`
3. Click **Save**.
4. Now, you should see two sites: `example.com` and the one you just created.
5. Click on your newly created site and check the **address bar**, which should look like:
   ```
   http://127.0.0.1:8000/admin/sites/site/5/change/
   ```
   The last number (`5` in this case) is your **Site ID**.
6. **Update `settings.py`** with:
   ```python
   SITE_ID = 5  # Replace with your actual site ID
   ```

### Step 5: Add GitHub Social Application
1. Go to **Social Applications → Add Social Application**.
2. Fill in:
   - **Provider:** `GitHub`
   - **Name:** `GitHub OAuth`
   - **Client ID:** `Ov23li0JG2RoWmaOE1CV`
   - **Secret Key:** `3281a84cae4d4098d78e894bebf1c46fe98fb9fb`
3. Under **Available Sites**, **double-click** `http://127.0.0.1:8000/` to move it under **Chosen Sites**.
4. Click **Save**.

### Step 6: Final Setup
1. Ensure `SITE_ID` is correctly set in `settings.py`.
2. Run:
   ```sh
   python manage.py migrate  
   python manage.py runserver
   ```
3. **Now, GitHub login/signup should work!** 🎉

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.  
2. Create a new branch:  
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes and push:  
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature-name
   ```
4. Submit a pull request.

---
## Project Structure
```bash
WhitePaper/
    .gitignore
    accounts/
        __init__.py
        admin.py
        apps.py
        migrations/
            __init__.py
        models.py
        tests.py
        urls.py
        views.py
    CODE_OF_CONDUCT.md
    LICENSE
    manage.py
    MyNotepad/
        __init__.py
        asgi.py
        middleware.py
        settings.py
        urls.py
        wsgi.py
    notes/
        __init__.py
        admin.py
        apps.py
        migrations/
            0001_initial.py
            __init__.py
        models.py
        tests.py
        urls.py
        views.py
    notesapp/
        __init__.py
        admin.py
        apps.py
        migrations/
            0001_initial.py
            0002_auto_20210905_1347.py
            __init__.py
        models.py
        tests.py
        urls.py
        views.py
    README.md
    requirements.txt
    static/
        css/
            NewStyle.css
            responsive.css
            style.css
        images/
        javascript/
            Theme.js
            authenticated.js
            autosave.js
            script.js
    templates/
        notesapp/
            index.html
            login.html
            main.html
            password_reset.html
            reset_password.html
            shared_note.html
            signup.html

```

## License

This project is licensed under the [MIT License](LICENSE).

## Collaborators
We are grateful to the following contributors who have worked on this project

<a href="https://github.com/ygowthamr/WhitePaper/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ygowthamr/WhitePaper" />
</a>

---

Feel free to reach out for any queries or suggestions at [ygowthamr@gmail.com]. 😊
