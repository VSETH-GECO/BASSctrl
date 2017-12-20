node {
    if (env.BRANCH_NAME == 'master' || env.BRANCH_NAME == 'dev') {
        def workingdir = pwd()
        def docker_params = '--entrypoint /bin/sh -v ${workingdir}:/app -v /root/node_modules:/app/node_modules -w /app'

        stage('Clone Repository') {
            checkout scm
        }

        docker.image('alexsuch/angular-cli:1.5').inside(${docker_params}) {

          stage('Install node packages') {
            sh 'npm install'
          }

          stage('Angular build') {
            sh 'ng build -prod'
          }
        }

        stage('Make archive') {
          sh 'tar -czvf site.tar.gz dist/'
          archiveArtifacts artifacts: '**/site.tar.gz', fingerprint: true
        }
    }
}
