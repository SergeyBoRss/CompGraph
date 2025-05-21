using OpenTK.Graphics.OpenGL;
using OpenTK.Mathematics;

namespace GameOpenGL;

public static class Primitives
{
    public static void QuadXz(float width, float length,
        float offsetX = 0f, float offsetZ = 0f)
    {
        float w = width / 2f;
        float l = length / 2f;
        GL.Begin(PrimitiveType.Quads);
        GL.Vertex3(offsetX - w, 0, offsetZ - l);
        GL.Vertex3(offsetX + w, 0, offsetZ - l);
        GL.Vertex3(offsetX + w, 0, offsetZ + l);
        GL.Vertex3(offsetX - w, 0, offsetZ + l);
        GL.End();
    }

    public static void Sphere(float r, int slices, int stacks)
    {
        for (int i = 0; i < stacks; i++)
        {
            double lat0 = Math.PI * (-0.5 + (double)i / stacks);
            double lat1 = Math.PI * (-0.5 + (double)(i + 1) / stacks);
            double z0 = r * Math.Sin(lat0), zr0 = r * Math.Cos(lat0);
            double z1 = r * Math.Sin(lat1), zr1 = r * Math.Cos(lat1);

            GL.Begin(PrimitiveType.QuadStrip);
            for (int j = 0; j <= slices; j++)
            {
                double lng = 2 * Math.PI * (j % slices) / slices;
                double x = Math.Cos(lng), y = Math.Sin(lng);
                GL.Normal3(x * zr0, y * zr0, z0);
                GL.Vertex3(x * zr0, y * zr0, z0);
                GL.Normal3(x * zr1, y * zr1, z1);
                GL.Vertex3(x * zr1, y * zr1, z1);
            }

            GL.End();
        }
    }

    public static void Cube(Vector3 s)
    {
        Vector3 h = s / 2f;
        GL.Begin(PrimitiveType.Quads);
        // фронт
        GL.Vertex3(-h.X, -h.Y, h.Z);
        GL.Vertex3(h.X, -h.Y, h.Z);
        GL.Vertex3(h.X, h.Y, h.Z);
        GL.Vertex3(-h.X, h.Y, h.Z);
        // зад
        GL.Vertex3(-h.X, -h.Y, -h.Z);
        GL.Vertex3(-h.X, h.Y, -h.Z);
        GL.Vertex3(h.X, h.Y, -h.Z);
        GL.Vertex3(h.X, -h.Y, -h.Z);
        // лево
        GL.Vertex3(-h.X, -h.Y, -h.Z);
        GL.Vertex3(-h.X, -h.Y, h.Z);
        GL.Vertex3(-h.X, h.Y, h.Z);
        GL.Vertex3(-h.X, h.Y, -h.Z);
        // право
        GL.Vertex3(h.X, -h.Y, -h.Z);
        GL.Vertex3(h.X, h.Y, -h.Z);
        GL.Vertex3(h.X, h.Y, h.Z);
        GL.Vertex3(h.X, -h.Y, h.Z);
        // верх
        GL.Vertex3(-h.X, h.Y, -h.Z);
        GL.Vertex3(-h.X, h.Y, h.Z);
        GL.Vertex3(h.X, h.Y, h.Z);
        GL.Vertex3(h.X, h.Y, -h.Z);
        // низ
        GL.Vertex3(-h.X, -h.Y, -h.Z);
        GL.Vertex3(h.X, -h.Y, -h.Z);
        GL.Vertex3(h.X, -h.Y, h.Z);
        GL.Vertex3(-h.X, -h.Y, h.Z);
        GL.End();
    }

    public static void Cylinder(float radius, float height, int segments = 20)
    {
        float halfHeight = height / 2f;
        
        GL.Begin(PrimitiveType.QuadStrip);
        for (int i = 0; i <= segments; i++)
        {
            double angle = 2 * Math.PI * i / segments;
            float x = radius * (float)Math.Cos(angle);
            float z = radius * (float)Math.Sin(angle);
            GL.Vertex3(x, -halfHeight, z);
            GL.Vertex3(x, +halfHeight, z);
        }

        GL.End();
        
        GL.Begin(PrimitiveType.TriangleFan);
        GL.Vertex3(0, -halfHeight, 0);
        for (int i = 0; i <= segments; i++)
        {
            double angle = 2 * Math.PI * i / segments;
            float x = radius * (float)Math.Cos(angle);
            float z = radius * (float)Math.Sin(angle);
            GL.Vertex3(x, -halfHeight, z);
        }

        GL.End();
        
        GL.Begin(PrimitiveType.TriangleFan);
        GL.Vertex3(0, +halfHeight, 0);
        for (int i = 0; i <= segments; i++)
        {
            double angle = 2 * Math.PI * i / segments;
            float x = radius * (float)Math.Cos(angle);
            float z = radius * (float)Math.Sin(angle);
            GL.Vertex3(x, +halfHeight, z);
        }

        GL.End();
    }
}