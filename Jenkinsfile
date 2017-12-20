pipeline {
  agent {
    docker {
      image 'alexsuch/angular-cli:1.5'
      args  '--entrypoint /bin/sh -v $WORKSPACE:/app -w /app'
    }
  }
  stages {
    stage('Install node packages') {
      steps {
        sh 'npm install'
      }
    }

    stage('Angular build') {
      steps {
        sh 'ng build -prod --no-progress'
      }
    }

    stage('Make archive') {
      steps {
        sh 'tar -czvf site.tar.gz dist/'
        archiveArtifacts artifacts: '**/site.tar.gz', fingerprint: true
      }
    }
  }

}
