# Utils Directory

This folder contains specialized utility functions for processing external domain data and transforming it into formats compatible with the application state. Unlike the `lib` folder, which contains general-purpose helpers, this directory focuses on domain-specific data parsing.

## Key Files

* **`parseElectionData.ts`**: Contains the logic and TypeScript interfaces for handling election-related data structures. It defines the `RawQuestion` type used throughout the app to represent ballot items and election metadata.

## Core Functionality

* **Data Normalization**: Functions here are responsible for taking raw JSON inputs (from uploaded files or static datasets) and ensuring they adhere to the application's internal data models.
* **Election Metadata Parsing**: Specifically handles the extraction of questions, candidates, and contest information from complex election JSON files.