# Votegrity

This project is a drag and drop pdf creator that allows for streamlined election document creation while also being flexible enough accommodate for any document type. While this is like Google Docs or Microsoft Word, it is more restrictive so that eventually, outside election administrators will be able to create and format their own election documents while conforming to Votegrity’s document style. Google Docs and Microsoft Word are both very powerful document creators, and while they are currently used, they are not the ideal solution due to the absolute freedom they provide to the document creator.

# Application Stack

## Front End
- Typescript
- React
- TailwindCSS (note current version of Tailwind not working with
- shadcn
- Recharts
- Zustand
- Zod
- ESLint
- Prettier
- Vite

## Backend
- Python (3.13.5)
- FastAPI
- SQLModel
- Pydantic
- Alembic
- Ruff
- Docker
- PostgreSQL

## Hosting
- Azure Cloud Infrastructure (see EMS System Architecture)
- Backend API deployed to App Containers
- Frontend Static Web Apps
- PostgreSQL Flexible Server

## Serverless Infrastructure
This app will be deployed to AWS as we will be migrating our existing applicatoins to AWS in the future.

### AWS Services
- CloudFormation (CDK) TBD
- CloudFront
- S3 Website
- API Gateway
- Lambda
- PostgreSQL or DynamoDB