FROM heroku/cedar:14

# $HOME is dedicated to mounting or copying in the application
ENV HOME /app/user/

# $HEROKU is where the platform is built - binaries like node, ruby, etc
ENV HEROKU /app/heroku/

# $PROFILE is a magic directory for Heroku
ENV PROFILE /app/.profile.d/

# $INIT is kept out of /app so it won't be duplicated on Heroku
# Heroku already has a mechanism for running .profile.d scripts,
# so this is just for local parity
ENV INIT /usr/bin/init

# Internally, we arbitrarily use port 3000
ENV PORT 3000

RUN mkdir -p $HOME $HEROKU $PROFILE

RUN echo "#!/bin/bash" > $INIT
RUN echo "cd $HOME" >> $INIT
RUN echo "for SCRIPT in $PROFILE/*; do source \$SCRIPT; done" >> $INIT
RUN echo "exec \$*" >> $INIT
RUN chmod +x $INIT

WORKDIR $HOME

# Is there a way to use the ENV here?
COPY . /app/user/

<%= platforms %>

# Is there a way to use the ENV here?
ENTRYPOINT ["/usr/bin/init"]
EXPOSE 3000
