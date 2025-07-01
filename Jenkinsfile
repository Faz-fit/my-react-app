pipeline {
  agent any
  
  environment {
    // Define the path for Node.js (if installed in a custom location)
    NODE_HOME = '/usr/bin/node' // Adjust based on actual path if needed
  }

  stages {
    stage('Checkout') {
      steps {
        // Checkout the code from the GitHub repository
        git 'https://github.com/Faz-fit/my-react-app.git'
      }
    }

    stage('Verify Node.js & npm versions') {
      steps {
        script {
          // Check if Node.js and npm are installed, and print their versions
          sh '''
            if ! command -v node &> /dev/null
            then
                echo "Node.js could not be found. Please install Node.js manually."
            else
                echo "Node.js version: $(node -v)"
            fi
            
            if ! command -v npm &> /dev/null
            then
                echo "npm could not be found. Please install npm manually."
            else
                echo "npm version: $(npm -v)"
            fi
          '''
        }
      }
    }

    stage('Install Dependencies') {
      steps {
        script {
          // Ensure npm is installed if not already available
          sh '''
            if ! command -v npm &> /dev/null
            then
                echo "Installing npm..."
                apt-get update && apt-get install -y npm
            fi
            npm install
          '''
        }
      }
    }

    stage('Build React App') {
      steps {
        // Run the build process for the React app
        sh 'npm run build'
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          // Tag Docker image with Git commit hash for better tracking
          def gitCommitHash = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
          docker.build("my-react-app:${gitCommitHash}")
        }
      }
    }

    stage('Run Docker Container') {
      steps {
        script {
          // Clean up any existing containers before running the new one
          sh '''
            if [ $(docker ps -q -f name=my-react-app-container) ]; then
              docker stop my-react-app-container
              docker rm my-react-app-container
            fi
          '''
          // Run the Docker container on port 3000, mapping to port 80 in the container
          sh 'docker run -d -p 3000:80 --name my-react-app-container my-react-app:${gitCommitHash}'
        }
      }
    }
  }

  post {
    always {
      // Clean up Docker images to avoid unnecessary disk usage
      sh 'docker system prune -f'
    }
  }
}
