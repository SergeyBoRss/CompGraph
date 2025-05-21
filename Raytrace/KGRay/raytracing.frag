#version 430 core

#define EPSILON 0.001
#define BIG 1000000.0
const int DIFFUSE = 1;
const int REFLECTION = 2;
const int REFRACTION = 3;

const int DIFFUSE_REFLECTION = 1;
const int MIRROR_REFLECTION = 2;
const int MAX_STACK_SIZE = 20;
const int MAX_DEPTH = 20;

const int COUNT_OF_TRIANGLES = 28;
const int COUNT_OF_MATERIALS = 14;
const int COUNT_OF_SPHERES = 9;


struct SCamera { vec3 Position;vec3 View;vec3 Up;vec3 Side;vec2 Scale; };
uniform SCamera uCamera;

struct SIntersection { float Time;vec3 Point;vec3 Normal;vec3 Color;vec4 LightCoeffs;float ReflectionCoeff;float RefractionCoeff;int MaterialType;float IOR; };

in vec2 passPosition;
out vec4 FragColor;

struct SSphere { vec3 Center;float Radius;int MaterialIdx; };
SSphere spheres[COUNT_OF_SPHERES];

struct STriangle { vec3 v1;vec3 v2;vec3 v3;int MaterialIdx; };
STriangle triangles[COUNT_OF_TRIANGLES];

struct SRay { vec3 Origin;vec3 Direction; };

struct SLight { vec3 Position; };
SLight light;

struct SMaterial { vec3 Color;vec4 LightCoeffs;float ReflectionCoeff;float RefractionCoeff;int MaterialType;float IOR; };
SMaterial materials[COUNT_OF_MATERIALS];

struct STracingRay { SRay ray;float contribution;int depth;float currentIOR; };
struct Stack { int count;STracingRay arr[MAX_STACK_SIZE]; };
Stack stack;


bool isEmpty() {
    return (stack.count <= 0);
}

bool isFull() {
    return (stack.count == MAX_STACK_SIZE - 1);
}

bool pushRay(STracingRay secondaryRay) {
    if (!isFull() && secondaryRay.depth < MAX_DEPTH) {
        stack.arr[stack.count++] = secondaryRay;
        return true;
    }
    return false;
}

STracingRay popRay() {
    return stack.arr[--stack.count];
}

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(
    oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.x * axis.z + axis.y * s, 0.0,
    oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s, 0.0,
    oc * axis.x * axis.z - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c, 0.0,
    0.0, 0.0, 0.0, 1.0
    );
}

vec3 rotatePoint(vec3 point, vec3 center, vec3 axis, float angle) {
    mat4 rotMat = rotationMatrix(axis, angle);
    vec4 rotated = rotMat * vec4(point - center, 1.0);
    return rotated.xyz + center;
}

void CreateCube(vec3 center, float size, int materialIdx) {
    const float angle = radians(0.0);
    const vec3 axis = vec3(1.0, 1.0, 0.0);

    float halfSize = size / 2.0;
    vec3 vertices[8];

    vertices[0] = vec3(-halfSize, -halfSize, -halfSize);
    vertices[1] = vec3(halfSize, -halfSize, -halfSize);
    vertices[2] = vec3(halfSize, halfSize, -halfSize);
    vertices[3] = vec3(-halfSize, halfSize, -halfSize);
    vertices[4] = vec3(-halfSize, -halfSize, halfSize);
    vertices[5] = vec3(halfSize, -halfSize, halfSize);
    vertices[6] = vec3(halfSize, halfSize, halfSize);
    vertices[7] = vec3(-halfSize, halfSize, halfSize);

    for (int i = 0; i < 8; i++) {
        vertices[i] = rotatePoint(vertices[i], vec3(0.0), axis, angle) + center;
    }

    triangles[12] = STriangle(vertices[4], vertices[6], vertices[5], materialIdx);
    triangles[13] = STriangle(vertices[4], vertices[7], vertices[6], materialIdx);

    triangles[14] = STriangle(vertices[0], vertices[2], vertices[1], materialIdx);
    triangles[15] = STriangle(vertices[0], vertices[3], vertices[2], materialIdx);

    triangles[16] = STriangle(vertices[0], vertices[7], vertices[3], materialIdx);
    triangles[17] = STriangle(vertices[0], vertices[4], vertices[7], materialIdx);

    triangles[18] = STriangle(vertices[1], vertices[6], vertices[5], materialIdx);
    triangles[19] = STriangle(vertices[1], vertices[2], vertices[6], materialIdx);

    triangles[20] = STriangle(vertices[0], vertices[5], vertices[4], materialIdx);
    triangles[21] = STriangle(vertices[0], vertices[1], vertices[5], materialIdx);

    triangles[22] = STriangle(vertices[3], vertices[6], vertices[7], materialIdx);
    triangles[23] = STriangle(vertices[3], vertices[2], vertices[6], materialIdx);
}

void CreatePyramid(vec3 center, float a, int materialIdx) {
    const float angle = radians(0.0);
    const vec3 axis = vec3(0.0, 1.0, 1.0);

    float h = a * sqrt(6.0) / 3.0;
    float R = a * sqrt(3.0) / 3.0;
    float r = a * sqrt(3.0) / 6.0;


    vec3 vertices[4];
    vertices[0] = vec3(0.0, h, 0.0);
    vertices[1] = vec3(-a / 2, 0.0, -r);
    vertices[2] = vec3(0.0, 0.0, R);
    vertices[3] = vec3(a / 2, 0.0, -r);


    for (int i = 0; i < 4; i++) {
        vertices[i] = rotatePoint(vertices[i], vec3(0.0), axis, angle) + center;
    }
    triangles[24] = STriangle(vertices[0], vertices[1], vertices[2], materialIdx);// DAB
    triangles[25] = STriangle(vertices[0], vertices[2], vertices[3], materialIdx);// DBC
    triangles[26] = STriangle(vertices[0], vertices[3], vertices[1], materialIdx);// DCA

    triangles[27] = STriangle(vertices[2], vertices[1], vertices[3], materialIdx);// BAC


    for (int i = 24; i <= 27; i++) {
        triangles[i].MaterialIdx = materialIdx;
    }
}

void initializeDefaultScene()
{
    // Left wall (X = -5)
    triangles[0].v1 = vec3(-5.0, -5.0, -10.0);
    triangles[0].v2 = vec3(-5.0, 5.0, -10.0);
    triangles[0].v3 = vec3(-5.0, 5.0, 5.0);
    triangles[0].MaterialIdx = 0;

    triangles[1].v1 = vec3(-5.0, -5.0, -10.0);
    triangles[1].v2 = vec3(-5.0, 5.0, 5.0);
    triangles[1].v3 = vec3(-5.0, -5.0, 5.0);
    triangles[1].MaterialIdx = 0;

    // Back wall (Z = 5)
    triangles[2].v1 = vec3(-5.0, -5.0, 5.0);
    triangles[2].v2 = vec3(-5.0, 5.0, 5.0);
    triangles[2].v3 = vec3(5.0, 5.0, 5.0);
    triangles[2].MaterialIdx = 1;

    triangles[3].v1 = vec3(-5.0, -5.0, 5.0);
    triangles[3].v2 = vec3(5.0, 5.0, 5.0);
    triangles[3].v3 = vec3(5.0, -5.0, 5.0);
    triangles[3].MaterialIdx = 1;

    // Right wall (X = 5)
    triangles[4].v1 = vec3(5.0, 5.0, 5.0);
    triangles[4].v2 = vec3(5.0, -5.0, -10.0);
    triangles[4].v3 = vec3(5.0, -5.0, 5.0);
    triangles[4].MaterialIdx = 2;

    triangles[5].v1 = vec3(5.0, 5.0, 5.0);
    triangles[5].v2 = vec3(5.0, 5.0, -10.0);
    triangles[5].v3 = vec3(5.0, -5.0, -10.0);
    triangles[5].MaterialIdx = 2;

    // down wall (Y = -5)
    triangles[6].v1 = vec3(-5.0, -5.0, -10.0);
    triangles[6].v2 = vec3(5.0, -5.0, 5.0);
    triangles[6].v3 = vec3(5.0, -5.0, -10.0);
    triangles[6].MaterialIdx = 9;

    triangles[7].v1 = vec3(-5.0, -5.0, -10.0);
    triangles[7].v2 = vec3(-5.0, -5.0, 5.0);
    triangles[7].v3 = vec3(5.0, -5.0, 5.0);
    triangles[7].MaterialIdx = 9;

    // up wall (Y = 5)
    triangles[8].v1 = vec3(-5.0, 5.0, -10.0);
    triangles[8].v2 = vec3(5.0, 5.0, -10.0);
    triangles[8].v3 = vec3(-5.0, 5.0, 5.0);
    triangles[8].MaterialIdx = 6;

    triangles[9].v1 = vec3(-5.0, 5.0, 5.0);
    triangles[9].v2 = vec3(5.0, 5.0, -10.0);
    triangles[9].v3 = vec3(5.0, 5.0, 5.0);
    triangles[9].MaterialIdx = 6;

    // front wall (Z = -10)
    triangles[10].v1 = vec3(-5.0, -5.0, -10.0);
    triangles[10].v2 = vec3(5.0, 5.0, -10.0);
    triangles[10].v3 = vec3(-5.0, 5.0, -10.0);
    triangles[10].MaterialIdx = 7;

    triangles[11].v1 = vec3(-5.0, -5.0, -10.0);
    triangles[11].v2 = vec3(5.0, -5.0, -10.0);
    triangles[11].v3 = vec3(5.0, 5.0, -10.0);
    triangles[11].MaterialIdx = 7;

    spheres[0].Center = vec3(-1.0, -1.0, -2.0);
    spheres[0].Radius = 1.5;
    spheres[0].MaterialIdx = 4;

    spheres[1].Center = vec3(2.0, 1.0, 2.0);
    spheres[1].Radius = 1.0;
    spheres[1].MaterialIdx = 5;


//    CreatePyramid(vec3(1, -2, -6), 0.7, 4);
//    CreateCube(vec3(2, 2, -4), 1, 4);
}


SRay GenerateRay(SCamera camera, vec2 texCoords) {
    vec2 coords = texCoords * camera.Scale;
    vec3 direction = camera.View + camera.Side * coords.x + camera.Up * coords.y;
    return SRay(camera.Position, normalize(direction));
}

SCamera initializeDefaultCamera() {
    SCamera camera;
    camera.Position = vec3(0.0, 0.0, -9.0);
    camera.View = vec3(0.0, 0.0, 1.0);
    camera.Up = vec3(0.0, 1.0, 0.0);
    camera.Side = vec3(1.0, 0.0, 0.0);
    camera.Scale = vec2(1.0);
    return camera;
}

void initializeDefaultLightMaterials() {
    // light.Position = vec3(2.0, 4.0, -6.0);
    vec4 lightCoefs = vec4(0.4, 0.9, 0.0, 512.0);

    for (int i = 0; i < COUNT_OF_MATERIALS; i++) {
        materials[i].Color = vec3(0.4, 0.4, 0.4);
        materials[i].LightCoeffs = lightCoefs;
        materials[i].ReflectionCoeff = 0.0;
        materials[i].RefractionCoeff = 1.0;
        materials[i].MaterialType = DIFFUSE;
        materials[i].IOR = 1.0;
    }

    materials[0].Color = vec3(68, 69, 82) / 255;
    materials[1].Color = vec3(123, 119, 113) / 255;
    materials[2].Color = vec3(53, 32, 31) / 255;
    materials[3].Color = vec3(143, 137, 126) / 255;
    materials[6].Color = vec3(32, 29, 43) / 255;

    materials[7].Color = vec3(203, 137, 78) / 255;
    materials[8].Color = vec3(59, 27, 42) / 255;
    materials[9].Color = vec3(189, 189, 189) / 255;

    materials[10].Color = normalize(vec3(64, 244, 20));
    materials[11].Color = normalize(vec3(67, 187, 239));
    materials[12].Color = normalize(vec3(47, 47, 234));
    materials[13].Color = normalize(vec3(181, 18, 221));

    materials[4].MaterialType = MIRROR_REFLECTION;
    materials[4].ReflectionCoeff = 1.0;
    materials[4].RefractionCoeff = 0.0;
    materials[4].IOR = 1.5;

    materials[5].MaterialType = REFRACTION;
    materials[5].ReflectionCoeff = 0.03;
    materials[5].RefractionCoeff = 0.97;
    materials[5].IOR = 1.33;
    materials[5].Color = vec3(1.0);
    materials[5].LightCoeffs = vec4(0.0,
    0.1,
    0.2,
    128.0);
}

bool IntersectSphere(SSphere sphere, SRay ray, float start, float final, out float time)
{
    SRay localRay = ray;
    localRay.Origin -= sphere.Center;
    float A = dot(localRay.Direction, localRay.Direction);
    float B = 2.0 * dot(localRay.Direction, localRay.Origin);
    float C = dot(localRay.Origin, localRay.Origin) - sphere.Radius * sphere.Radius;
    float D = B * B - 4.0 * A * C;
    if (D > 0.0)
    {
        D = sqrt(D);
        float t1 = (-B - D) / (2.0 * A);
        float t2 = (-B + D) / (2.0 * A);
        if (t1 > t2)
        {
            float temp = t1;
            t1 = t2;
            t2 = temp;
        }
        if (t2 < 0.0) return false;
        if (t1 < 0.0 && t2 > 0.0)
        {
            time = t2;
            return true;
        }
        if (t1 > 0.0 && t2 > 0.0)
        {
            time = t1;
            return true;
        }
    }
    return false;
}

bool IntersectTriangle(SRay ray, vec3 v1, vec3 v2, vec3 v3, out float time)
{
    time = -1.0;
    vec3 A = v2 - v1;
    vec3 B = v3 - v1;

    vec3 N = cross(A, B);

    float NdotRayDirection = dot(N, ray.Direction);
    if (abs(NdotRayDirection) < EPSILON)
    return false;

    float d = dot(N, v1);

    float t = -(dot(N, ray.Origin) - d) / NdotRayDirection;

    if (t < 0.0)
    return false;

    vec3 P = ray.Origin + t * ray.Direction;

    vec3 C;

    vec3 edge1 = v2 - v1;
    vec3 VP1 = P - v1;
    C = cross(edge1, VP1);
    if (dot(N, C) < 0.0)
    return false;

    vec3 edge2 = v3 - v2;
    vec3 VP2 = P - v2;
    C = cross(edge2, VP2);
    if (dot(N, C) < 0.0)
    return false;

    vec3 edge3 = v1 - v3;
    vec3 VP3 = P - v3;
    C = cross(edge3, VP3);
    if (dot(N, C) < 0.0)
    return false;

    time = t;
    return true;

}

bool Raytrace(SRay ray, SSphere spheres[COUNT_OF_SPHERES], STriangle triangles[COUNT_OF_TRIANGLES], SMaterial materials[COUNT_OF_MATERIALS],
float start, float final, inout SIntersection intersect)
{
    bool result = false;
    float test = start;
    intersect.Time = final;

    for (int i = 0; i < COUNT_OF_SPHERES; i++) {
        SSphere sphere = spheres[i];
        if (IntersectSphere(sphere, ray, start, final, test) && test < intersect.Time) {
            intersect.Time = test;
            intersect.Point = ray.Origin + ray.Direction * test;
            intersect.Normal = normalize(intersect.Point - sphere.Center);

            int matIdx = sphere.MaterialIdx;
            intersect.Color = materials[matIdx].Color;
            intersect.LightCoeffs = materials[matIdx].LightCoeffs;
            intersect.ReflectionCoeff = materials[matIdx].ReflectionCoeff;
            intersect.RefractionCoeff = materials[matIdx].RefractionCoeff;
            intersect.MaterialType = materials[matIdx].MaterialType;
            intersect.IOR = materials[matIdx].IOR;

            result = true;
        }
    }

    for (int i = 0; i < COUNT_OF_TRIANGLES; i++) {
        STriangle triangle = triangles[i];
        if (IntersectTriangle(ray, triangle.v1, triangle.v2, triangle.v3, test) && test < intersect.Time) {
            intersect.Time = test;
            intersect.Point = ray.Origin + ray.Direction * test;
            intersect.Normal = normalize(cross(triangle.v2 - triangle.v1, triangle.v3 - triangle.v1));

            int matIdx = triangle.MaterialIdx;
            intersect.Color = materials[matIdx].Color;
            intersect.LightCoeffs = materials[matIdx].LightCoeffs;
            intersect.ReflectionCoeff = materials[matIdx].ReflectionCoeff;
            intersect.RefractionCoeff = materials[matIdx].RefractionCoeff;
            intersect.MaterialType = materials[matIdx].MaterialType;
            intersect.IOR = materials[matIdx].IOR;

            result = true;
        }
    }

    return result;
}

float Shadow(SLight light, SIntersection intersect)
{
    vec3 dir = normalize(light.Position - intersect.Point);
    float dist = distance(light.Position, intersect.Point);
    SRay shadowRay = SRay(intersect.Point + dir * EPSILON * 2.0, dir);

    SIntersection shadowIntersect;
    shadowIntersect.Time = BIG;

    float shadow = 1.0;
    if (Raytrace(shadowRay, spheres, triangles, materials, 0.0, dist, shadowIntersect))
    {
        float softness = 2.9;
        shadow = clamp(1.0 - (shadowIntersect.Time / dist) * softness, 0.0, 1.0);
    }
    return shadow;
}

vec3 Phong(SIntersection intersect, SLight light, float shadowing) {
    vec3 lightDir = normalize(light.Position - intersect.Point);
    vec3 viewDir = normalize(uCamera.Position - intersect.Point);
    vec3 reflectDir = reflect(-lightDir, intersect.Normal);

    float diff = max(dot(intersect.Normal, lightDir), 0.0);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), intersect.LightCoeffs.w);

    return intersect.LightCoeffs.x * intersect.Color +
    shadowing * (intersect.LightCoeffs.y * diff * intersect.Color +
    intersect.LightCoeffs.z * spec * vec3(1.0));
}

void main() {
    initializeDefaultScene();
    initializeDefaultLightMaterials();

    stack.count = 0;

    vec3 resultColor = vec3(0.0);
    SRay primaryRay = GenerateRay(uCamera, passPosition);


    STracingRay primaryTRay = STracingRay(primaryRay, 1.0, 0, 1.0);
    pushRay(primaryTRay);

    light.Position = vec3(2.0, 4.0, -6.0);

    while (!isEmpty()) {
        STracingRay trRay = popRay();
        SRay ray = trRay.ray;
        SIntersection intersect = SIntersection(
        BIG,
        vec3(0.0),
        vec3(0.0),
        vec3(0.0),
        vec4(0.0),
        0.0,
        0.0,
        0,
        1.0
        );



        if (!Raytrace(ray, spheres, triangles, materials, 0.0, BIG, intersect)) {
            resultColor += trRay.contribution * vec3(1.0);
            continue;
        }

        if (Raytrace(ray, spheres, triangles, materials, 0.0, BIG, intersect)) {
            switch (intersect.MaterialType) {
                case DIFFUSE_REFLECTION: {
                    float shadowing = Shadow(light, intersect);
                    resultColor += trRay.contribution * Phong(intersect, light, shadowing);
                    break;
                }

                case MIRROR_REFLECTION: {
                    if (trRay.depth >= MAX_DEPTH) break;

                    if (intersect.ReflectionCoeff < 1.0) {
                        float diffuseContrib = trRay.contribution * (1.0 - intersect.ReflectionCoeff);
                        float shadowing = Shadow(light, intersect);
                        resultColor += trRay.contribution * Phong(intersect, light, shadowing);
                    }

                    vec3 reflectDir = reflect(ray.Direction, intersect.Normal);
                    vec3 origin = intersect.Point + reflectDir * EPSILON;
                    STracingRay reflectRay = STracingRay(
                    SRay(origin, reflectDir),
                    trRay.contribution * intersect.ReflectionCoeff,
                    trRay.depth + 1, 1.0
                    );
                    pushRay(reflectRay);
                    break;
                }
                case REFRACTION: {
                    if (trRay.depth >= MAX_DEPTH) break;

                    float eta = trRay.currentIOR / intersect.IOR;
                    vec3 normal = intersect.Normal;

                    if (dot(ray.Direction, normal) > 0.0) {
                        normal = -normal;
                        eta = intersect.IOR / trRay.currentIOR;
                    }

                    vec3 refractDir = refract(normalize(ray.Direction), normal, eta);
                    vec3 reflectDir = reflect(ray.Direction, normal);

                    if (length(refractDir) < EPSILON) {
                        vec3 origin = intersect.Point + reflectDir * EPSILON;
                        pushRay(STracingRay(SRay(origin, reflectDir),
                        trRay.contribution, trRay.depth + 1, trRay.currentIOR));
                    } else {
                        vec3 refractOrigin = intersect.Point + refractDir * EPSILON;
                        pushRay(STracingRay(SRay(refractOrigin, refractDir),
                        trRay.contribution * intersect.RefractionCoeff,
                        trRay.depth + 1, intersect.IOR));

                        vec3 reflectOrigin = intersect.Point + reflectDir * EPSILON;
                        pushRay(STracingRay(SRay(reflectOrigin, reflectDir),
                        trRay.contribution * intersect.ReflectionCoeff,
                        trRay.depth + 1, trRay.currentIOR));
                    }
                    break;
                }
            }
        }
    }
    FragColor = vec4(clamp(resultColor, 0.0, 1.0), 1.0);
}