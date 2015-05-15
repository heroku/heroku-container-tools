# node init
ENV NODE_ENGINE 0.12.2
RUN mkdir -p $HEROKU/node
RUN curl -s https://s3pository.heroku.com/node/v$NODE_ENGINE/node-v$NODE_ENGINE-linux-x64.tar.gz | tar --strip-components=1 -xz -C $HEROKU/node
RUN echo "export PATH=\"$HEROKU/node/bin:$USER/node_modules/.bin:\$PATH\"" > $PROFILE/nodejs.sh
RUN chmod +x $PROFILE/nodejs.sh

# node onbuild
RUN $HEROKU/node/bin/npm install
