var ssh = angular.module('ssh', []);
ssh.controller('sshCtl', ['$scope', '$http', function ($scope, $http) {
    var SSH_FORM_DATA = "sshFormData";
    $scope.title = "SSH Console";

    $scope.ssh = {
        host: '16.165.217.163',
        user: 'root',
        pass: 'cmstest',
        cmd: 'source /root/keystonerc_admin && /root/create_vm.sh maso_vm 3',
    };
    $scope.msg = [];

    if (localStorage && localStorage[SSH_FORM_DATA])
        $scope.ssh = JSON.parse(localStorage.getItem(SSH_FORM_DATA));

    // SSH command
    $scope.sshExec = function () {
        var d = new Date();
        $scope.msg.push({content: $scope.ssh.cmd, time: d.toLocaleString()});
        $http.post('/ssh/exec', $scope.ssh).success(function (data) {
            console.log("execute ssh command");
            if (data) {
                var d = new Date();
                $scope.msg.push({content: data, time: d.toLocaleString()});
            }
        });
        if (localStorage)
            localStorage.setItem(SSH_FORM_DATA, JSON.stringify($scope.ssh));
    };
}]);