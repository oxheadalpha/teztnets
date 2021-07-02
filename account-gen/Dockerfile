FROM python:alpine
ENV PYTHONUNBUFFERED=1


RUN     apk add --no-cache gcc g++ python3-dev libffi-dev musl-dev make git libsodium-dev libsecp256k1-dev gmp-dev


RUN pip install pyblake2 pysodium numpy 
RUN pip install -e git+https://github.com/vbuterin/pybitcointools.git@aeb0a2bbb8bbfe421432d776c649650eaeb882a5#egg=bitcoin

COPY account_gen.py /

ENTRYPOINT ["/account_gen.py"]

CMD []
