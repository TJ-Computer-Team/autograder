FROM node:20

WORKDIR /autograder

COPY autograder/package*.json ./autograder/
RUN cd autograder && npm install

COPY ../ .

EXPOSE 3000

CMD ["npm", "run", "devStart", "--prefix", "autograder"]

