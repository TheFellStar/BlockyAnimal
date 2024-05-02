class Cube{
    constructor(){
        this.type='cube';
        this.color = [1.0,1.0,1.0,1.0];
        this.matrix = new Matrix4();
    }

    render(){
        var rgba = this.color;

        gl.uniform4f(u_FragColor, rgba [0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        //front of cube
        drawTriangle3D([0.0,0.0,0.0,  1.0,1.0,0.0,  1.0,0.0,0.0]);
        drawTriangle3D([0.0,0.0,0.0,  0.0,1.0,0.0,  1.0,1.0,0.0]);

        //back of cube
        drawTriangle3D([0.0,0.0,1.0,  1.0,1.0,1.0,  1.0,0.0,1.0]);
        drawTriangle3D([0.0,0.0,1.0,  0.0,1.0,1.0,  1.0,1.0,1.0]);

        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

        //top of cube
        drawTriangle3D( [0,1,0,  0,1,1,  1,1,1]);
        drawTriangle3D([0,1,0,  1,1,1,  1,1,0]);

        //bottom of cube
        drawTriangle3D( [0,0,0,  0,0,1,  1,0,1]);
        drawTriangle3D([0,0,0,  1,0,1,  1,0,0]);

        //left side of cube
        drawTriangle3D( [0,1,1,  0,1,0,  0,0,0]);
        drawTriangle3D([0,0,0,  0,0,1,  0,1,1]);

        //right side of cube
        drawTriangle3D( [1,1,1,  1,1,0,  1,0,0]);
        drawTriangle3D([1,0,0,  1,0,1,  1,1,1]);
    }
}