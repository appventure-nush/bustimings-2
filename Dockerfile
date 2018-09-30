FROM ubuntu:16.04

# Keep updated with https://raw.githubusercontent.com/hhvm/hhvm-docker/master/hhvm-latest/Dockerfile

ARG HHVM_PACKAGE=hhvm
ARG HHVM_REPO_DISTRO=xenial
ENV HHVM_DISABLE_NUMA true

RUN \
  apt-get update -y && apt-get install -y software-properties-common apt-transport-https \
  && apt-key adv --recv-keys --keyserver hkp://keyserver.ubuntu.com:80 0x5a16e7281be7a449 \
  && apt-key adv --recv-keys --keyserver hkp://keyserver.ubuntu.com:80 0xB4112585D386EB94 \
  && add-apt-repository "deb https://s3-us-west-2.amazonaws.com/hhvm-downloads/ubuntu ${HHVM_REPO_DISTRO} main" \
  && apt-get update -y \
  && apt-get install -y ${HHVM_PACKAGE} git wget curl \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* \
  && sed -i 's,s3-us-west-2.amazonaws.com/hhvm-downloads/,dl2.hhvm.com/,' /etc/apt/sources.list

EXPOSE 8080
WORKDIR /srv

COPY 4.php 5.php index.php config.php /srv/

ENTRYPOINT ["/usr/bin/hhvm", "-m", "s", "-v", "Server.AllowRunAsRoot=1", "-p", "8080"]
