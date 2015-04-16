FROM heroku/cedar:14

RUN useradd -d /app -m app
USER app
WORKDIR /app

ENV HOME /app
ENV RUBY_ENGINE <%= ruby_engine %>
ENV BUNDLER_VERSION 1.7.12
ENV NODE_ENGINE 0.10.38
ENV PORT 3000

RUN mkdir -p /app/heroku/ruby
RUN curl -s https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/cedar-14/ruby-$RUBY_ENGINE.tgz | tar xz -C /app/heroku/ruby
ENV PATH /app/heroku/ruby/bin:$PATH

RUN mkdir -p /app/heroku/bundler
RUN curl -s https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/bundler-$BUNDLER_VERSION.tgz | tar xz -C /app/heroku/bundler
ENV PATH /app/heroku/bundler/bin:$PATH
ENV GEM_PATH=/app/heroku/bundler:$GEM_PATH

RUN mkdir -p /app/heroku/node
RUN curl -s https://s3pository.heroku.com/node/v$NODE_ENGINE/node-v$NODE_ENGINE-linux-x64.tar.gz | tar --strip-components=1 -xz -C /app/heroku/node
ENV PATH /app/heroku/node/bin:$PATH

ONBUILD COPY . /app/src
ONBUILD WORKDIR /app/src
ONBUILD RUN bundle install # TODO: desirable if --path parameter were passed
ONBUILD EXPOSE 3000
ONBUILD CMD bundle exec puma -C config/puma.rb # TODO: This is broken
