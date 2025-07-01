pipeline {
  agent any

  environment {
    NODE_HOME = '/usr/bin/node' // Specify the path to node if it's in a custom location
  }

  stages {
    stage('Checkout') {
      steps {
        git 'https://github.com/Faz-fit/my-react-app.git'
      }
    }

stage('Verify Node.js & npm versions') {
  steps {
    script {
      // Check if node and npm are installed and print their versions
      sh '''
        if ! command -v node &> /dev/null
        then
            echo "Node.js could not be found. Installing Node.js."
            apt-get install -y nodejs
        else
            echo "Node.js version: $(node -v)"
        fi
        
        if ! command -v npm &> /dev/null
        then
            echo "npm could not be found. Installing npm."
            apt-get install -y npm
        else
            echo "npm version: $(npm -v)"
        fi
      '''
    }
  }
}


    stage('Install Dependencies') {
      steps {
        sh 'npm install'
      }
    }

    stage('Build React App') {
      steps {
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
          // Run Docker container on port 3000 mapping to port 80 in the container
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
