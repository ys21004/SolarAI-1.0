from setuptools import setup, find_packages

setup(
    name="solarai-backend",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        'flask',
        'flask-cors',
        'firebase-admin',
        'python-dotenv',
    ],
) 