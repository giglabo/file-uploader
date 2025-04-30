# Process Docs

Activate venv `source ./venv/bin/activate`

## Create a project
Omit this step.

    mkdocs new giglabo-file-uploader-docs


## Navigate and Run

  cd giglabo-file-uploader-docs

  mkdocs serve


## Serve wrapped command

  sh ./serve.sh


      ./venv/bin/pip3 freeze > requirements.txt


  pip uninstall fix-urls-plugin -y && pip install -e .

