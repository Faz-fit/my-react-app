pipeline {
    agent any

    environment {
        // GitHub repository URL
        GITHUB_REPO = 'https://github.com/Faz-fit/my-react-app.git'
        SERVER = 'arunalusupermarket.shop'
        REACT_PORT = '8080'
    }

    stages {
        stage('Clone Repository') {
            steps {
                // Clone the GitHub repository
                git branch: 'main', url: "${GITHUB_REPO}"
            }
        }

        stage('Install Dependencies') {
            steps {
                // Install dependencies using npm
                script {
                    sh 'npm install'
                }
            }
        }

        stage('Build React App') {
            steps {
                // Build the React app
                script {
                    sh 'npm run build'
                }
            }
        }

        stage('Deploy to Server') {
            steps {
                script {
                    // Deploy the build to your server using SSH
                    sh '''
                    ssh user@${SERVER} "
                        cd /path/to/deploy/folder && rm -rf * && cp -r ./build/* ."
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'React app deployed successfully!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}
