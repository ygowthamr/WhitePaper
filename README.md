
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

![White_paper4](https://github.com/user-attachments/assets/a05cfcbb-4161-47c6-b245-59f58b2f946f)

### Login Page

![white_paper1](https://github.com/user-attachments/assets/67bc73bf-c72a-45ee-a74d-794de86798d6)

### Home Page

![White_paper2](https://github.com/user-attachments/assets/a8f3d584-dc9b-48fb-80d5-d144f8d7250e)

### Create a new note

![White_paper3](https://github.com/user-attachments/assets/52e57faa-5a3e-407f-b621-157144040343)

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

## License

This project is licensed under the [MIT License](LICENSE).



## Collaborators
We are grateful to the following contributors who have worked on this project


<a href="https://github.com/ygowthamr/WhitePaper/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ygowthamr/WhitePaper" />
</a>

---

Feel free to reach out for any queries or suggestions at [ygowthamr@gmail.com]. 😊
