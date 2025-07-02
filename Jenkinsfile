pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'my-react-app'
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
    }

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/Faz-fit/my-react-app.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Build Docker image
                    sh 'docker-compose -f $DOCKER_COMPOSE_FILE build'
                }
            }
        }

        stage('Run Docker Container') {
            steps {
                script {
                    // Run the container
                    sh 'docker-compose -f $DOCKER_COMPOSE_FILE up -d'
                }
            }
        }

        stage('Post-Run') {
            steps {
                script {
                    // Optionally check container logs or perform other actions
                    sh 'docker ps'
                }
            }
        }
    }

    post {
        always {
            cleanWs() // Clean up workspace after build
        }
    }
}
