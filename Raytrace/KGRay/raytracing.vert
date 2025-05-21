#version 430 core

in vec3 vPosition;
out vec2 passPosition; 

void main() {
    gl_Position = vec4(vPosition, 1.0);
    passPosition = vPosition.xy; 
}