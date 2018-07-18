FROM alpine


ENV PACKAGES "postgresql-client"
RUN apk add --no-cache --update $PACKAGES && rm -rf /var/cache/apk/*

RUN mkdir /etc/periodic/minute
COPY crontab /etc/crontab/root
RUN crontab /etc/crontab/root

COPY test.sh /etc/periodic/minute/test
RUN chmod a+x /etc/periodic/minute/test

CMD ["/usr/sbin/crond", "-f", "-l", "8"]