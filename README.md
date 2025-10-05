# Playwright Test Project

This project is set up to perform automated testing using Playwright. The primary focus is on testing the login functionality of the OrangeHRM demo application.

## Project Structure

```
playwright-tests
├── tests
│   ├── login.spec.ts        # Contains test specifications for the login functionality
│   └── setup
│       └── auth.setup.ts    # Setup configurations for the tests
├── playwright.config.ts      # Configuration file for Playwright
├── package.json              # npm configuration file with dependencies and scripts
├── .gitignore                # Specifies files and directories to be ignored by Git
└── README.md                 # Documentation for the project
```

## Getting Started

### Prerequisites

- Node.js (version 12 or later)
- npm (Node package manager)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd playwright-tests
   ```

2. Install the dependencies:
   ```
   npm install
   ```

### Running Tests

To run the tests, use the following command:
```
npx playwright test
```

### Test Details

- The `login.spec.ts` file contains a test case that navigates to the login page of the OrangeHRM demo application, enters the username (`admin`) and password (`admin123`), and submits the login form.
- The `auth.setup.ts` file is responsible for any necessary setup before the tests are executed.

### Contributing

Feel free to submit issues or pull requests for improvements or additional tests.

### License

This project is licensed under the MIT License.