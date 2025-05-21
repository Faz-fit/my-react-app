pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps {
        git 'https://github.com/Faz-fit/my-react-app.git'
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
          docker.build('my-react-app')
        }
      }
    }

    stage('Run Docker Container') {
      steps {
        script {
          sh '''
            if [ $(docker ps -q -f name=my-react-app-container) ]; then
              docker stop my-react-app-container
              docker rm my-react-app-container
            fi
          '''
          sh 'docker run -d -p 3000:80 --name my-react-app-container my-react-app'
        }
      }
    }
  }
}
