using OpenTK.Graphics.OpenGL;
using OpenTK.Mathematics;

namespace GameOpenGL;

public class LaneManager
{
    private readonly List<Vector3> _tiles = new();
    private const float TileLen = 40f;
    private const int TilesAhead = 5;
    private const float Speed = 10f;

    public LaneManager()
    {
        for (int i = 0; i < TilesAhead; i++)
            _tiles.Add(new Vector3(0, 0, -i * TileLen));
    }

    public void Update(float dt)
    {
        float dz = Speed * dt;
        for (int i = 0; i < _tiles.Count; i++)
        {
            var t = _tiles[i];
            t.Z += dz;
            if (t.Z > TileLen) t.Z -= TilesAhead * TileLen;
            _tiles[i] = t;
        }
    }

    public void Draw()
    {
        const float roadWidth = 6f;
        const float stripeW = 0.15f;
        const int dashes = 6;

        const float yGrass = 0f;
        const float yRoad = 0.010f; // асфальт
        const float yStripe = 0.012f; // белая краска, чуть выше

        foreach (var t in _tiles)
        {
            GL.PushMatrix();
            GL.Translate(t);

            GL.Color3(0.15f, 0.55f, 0.15f);
            GL.PushMatrix();
            GL.Translate(0, yGrass, 0);
            Primitives.QuadXz(20f, TileLen, -8f);
            Primitives.QuadXz(20f, TileLen, 8f);
            GL.PopMatrix();

            GL.PushMatrix();
            GL.Translate(0, yRoad, 0);
            GL.Color3(0.18f, 0.18f, 0.18f);
            Primitives.QuadXz(roadWidth, TileLen);


            GL.PushMatrix();
            GL.Translate(0, yStripe, 0);
            GL.Color3(0.9f, 0.9f, 0.9f);
            float dashLen = TileLen / dashes;
            for (int i = 0; i < dashes; i += 2)
            {
                float z = -TileLen / 2 + i * dashLen + dashLen / 2;
                Primitives.QuadXz(stripeW, dashLen, -1f, z); // левый
                Primitives.QuadXz(stripeW, dashLen, 1f, z); // правый
            }

            // ── столбы по краям ──
            float poleHeight = 2.5f;
            GL.Color3(0.3f, 0.3f, 0.3f);

            GL.PushMatrix();
            GL.Translate(-4f, poleHeight / 2f,
                0f);
            Primitives.Cylinder(0.05f, poleHeight);
            GL.PopMatrix();

            GL.PushMatrix();
            GL.Translate(4f, poleHeight / 2f, 0f); // правый столб
            Primitives.Cylinder(0.05f, poleHeight);
            GL.PopMatrix();


            GL.PopMatrix();

            GL.PopMatrix();
        }
    }
}