# Backend Service with Permify Integration

This repository contains a backend service built with **Node.js** that communicates with **Azure Service Bus** and interacts with **Permify** for permission management. The project consists of two main components:

1. **Node.js Backend**: Sends messages to Azure Service Bus and interacts with the Permify API using the **Permify JavaScript REST SDK** for permission checks and data filtering.
2. **Java Consumer Service**: Reads messages from Azure Service Bus and writes data to Permify using the **Permify Java SDK**.

## Architecture

The architecture consists of the following components:
- **Node.js Backend**: Responsible for sending user-organization and user-repository relation data to the Service Bus queue and performing permission checks.
- **Service Bus Queue**: Used for decoupling the backend from the Java consumer service.
- **Java Consumer Service**: Reads messages from the Service Bus queue and writes user-organization and user-repository relations to Permify.
- **Permify**: Provides the API and SDKs for permission management, data filtering, and relationship handling.

## Entities and Schema

The entities used in this project are **user**, **organization**, and **repository**. The relationships between these entities, as well as permissions, are managed through the following schema:

### Entity Definitions

```permify
entity user {}

entity organization {
    relation admin @user
    relation member @user
}

entity repository {
    relation parent @organization
    relation owner @user

    permission edit   = parent.admin or owner
    permission delete = owner
}
```
- **User**: Represents a user in the system.
- **Organization**: Represents an organization. It has two relations: `admin` and `member`, both pointing to the `user` entity.
- **Repository**: Represents a repository. It has a `parent` relation pointing to the `organization` entity and an `owner` relation pointing to the `user` entity. Permissions for `edit` and `delete` are derived from these relations.

### Permissions

- **Edit Permission**: A user can edit a repository if they are either an `admin` of the parent organization or the `owner` of the repository.
- **Delete Permission**: Only the `owner` of a repository can delete it.

## Features

1. **User-Organization and User-Repository Relationship Management**:
   - The backend sends a message to the Azure Service Bus to create relationships between users, organizations, and repositories.
   - The Java consumer service reads the message and creates the relationships in Permify.

2. **Permission Checks**:
   - The backend service uses the **Permify JavaScript REST SDK** to check user permissions and filter data based on roles.

3. **Decoupled Communication**:
   - The use of Azure Service Bus allows asynchronous communication between the Node.js backend and the Java consumer service, ensuring scalability and separation of concerns.
