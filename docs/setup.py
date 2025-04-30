from setuptools import setup, find_packages


setup(
  name='fix-urls-plugin',
  version='0.1.0',
  description='',
  long_description='',
  keywords='mkdocs',
  url='',
  author='Giglabo.com',
  author_email='https://giglabo.com/contact-i3kpgwz0jwyw02y004zaqxle',
  license='',
  python_requires='>=2.7',
  install_requires=[
    'mkdocs>=1.0.4'
  ],
  classifiers=[
    'Development Status :: 4 - Beta',
    'Intended Audience :: Developers',
    'Intended Audience :: Information Technology',
    'License :: OSI Approved :: MIT License',
    'Programming Language :: Python',
    'Programming Language :: Python :: 3 :: Only',
    'Programming Language :: Python :: 3.4',
    'Programming Language :: Python :: 3.5',
    'Programming Language :: Python :: 3.6',
    'Programming Language :: Python :: 3.7'
  ],
  packages=find_packages(),
  entry_points={
    'mkdocs.plugins': [
      'fix-urls = plugins.fix_urls.plugin:FixUrlsPlugin'
    ]
  }
)
