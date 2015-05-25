FROM heroku/cedar:14

RUN useradd -d /app -m app
USER app
WORKDIR /app/src

ENV HOME /app
ENV PORT 3000
ENV PATH /app/.heroku/php/bin:/app/.heroku/php/sbin:/tmp/php-pack/bin:$PATH
ENV STACK cedar-14
ENV DOCKER_BUILD 1


RUN mkdir -p /app/.heroku
RUN mkdir -p /tmp/app
RUN mkdir -p /app/src
RUN mkdir -p /app/.profile.d
RUN mkdir -p /tmp/php-pack
RUN mkdir -p /tmp/cache
RUN mkdir -p /tmp/environment


WORKDIR /app/src
WORKDIR /tmp/php-buildpack/bin

WORKDIR /app/
ONBUILD COPY . /app/

RUN git clone https://github.com/heroku/heroku-buildpack-php.git /tmp/php-pack --depth 1
ONBUILD RUN bash -l /tmp/php-pack/bin/compile /app /tmp/cache /app/.env

ONBUILD EXPOSE 3000
