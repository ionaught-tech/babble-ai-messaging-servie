# Babble AI Messaging Service

This is a real-time messaging service built with Node.js, Express, Socket.IO, and MongoDB. It features a change stream integration to listen for database events and broadcast them to clients.

## Features

- Real-time messaging with Socket.IO
- MongoDB integration with Mongoose
- Change stream support for real-time database updates
- User association with messages
- TypeScript for type safety
- Testing with Jest and Supertest

## Prerequisites

- Node.js (v14 or later)
- MongoDB (running as a replica set)

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd babble-ai-messaging-servie
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

## Configuration

1.  Create a `.env` file in the root of the project.
2.  Add your MongoDB connection string to the `.env` file. Make sure your MongoDB instance is running as a replica set.

    ```
    MONGO_URI=mongodb://localhost:27017/babble-ai-messaging?replicaSet=rs0
    ```

## Running the Application

To start the server, run the following command:

```bash
npm start
```

The server will start on port 3000.

## Running Tests

To run the tests, use the following command:

```bash
npm test
```

## API

### Socket.IO Events

-   **Connection**: To connect to the server, a client must provide a `user-id` in the handshake headers.

    ```javascript
    const socket = io('http://localhost:3000', {
      extraHeaders: {
        'user-id': 'your-user-id'
      }
    });
    ```

-   **`chat message`**: Send a message to the server.

    ```javascript
    socket.emit('chat message', 'Hello, world!');
    ```

-   **`chat message` (incoming)**: Receive a new chat message.

    ```javascript
    socket.on('chat message', (data) => {
      console.log(data); // { content: 'Hello, world!', userId: 'some-user-id' }
    });
    ```

-   **`new external event`**: Receive a new event from the `external-events` collection.

    ```javascript
    socket.on('new external event', (data) => {
      console.log(data);
    });
    ```

## Docker

To run the application using Docker, follow these steps:

1.  Build the Docker image:
    ```bash
    docker compose up.
    ```

2.  Run the Docker container:
    ```bash
    docker exec -it mongo-single-rs mongosh
    ```
3.  Start replica set in MongoDB shell:
    ```javascript
    rs.initiate()
    ```


The application will be accessible at `http://localhost:3000`.
