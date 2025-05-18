FROM node:20

# Set working directory
WORKDIR /autograder

# Copy package files and install dependencies
COPY autograder/package*.json ./autograder/
RUN cd autograder && npm install

# Copy the rest of the project files
COPY ../ .

# Expose the app port (adjust if needed)
EXPOSE 3000

# Start the server
CMD ["npm", "run", "devStart", "--prefix", "autograder"]

