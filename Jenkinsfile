pipeline {
  agent {
    docker {
      image 'alexsuch/angular-cli:1.5'
      label 'Angular CLI'
      args  '--entrypoint /bin/sh -v $WORKSPACE:/app -v /root/node_modules:/app/node_modules -w /app'
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
        sh 'ng build -prod'
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
