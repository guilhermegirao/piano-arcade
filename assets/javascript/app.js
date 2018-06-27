var imports = {
    load: () => {
        let i = [
            'Vendor/jquery-3.3.1.min',
            'Vendor/timer.min',
            'Game/Game',
        ];

        for ( let j = 0; j < i.length; j++ ) {
            document.write ('<script src="assets/javascript/'+ i [j] +'.js"></script>');
        }

        document.getElementById('remove').outerHTML = '';
    }
}