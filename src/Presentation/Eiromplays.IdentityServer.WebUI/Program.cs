using Duende.Bff.Yarp;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddBff()
    .AddRemoteApis();

builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = "cookie";
    options.DefaultChallengeScheme = "oidc";
    options.DefaultSignOutScheme = "oidc";
}).AddCookie("cookie", options =>
{
    options.Cookie.Name = "__Host-bff";
    options.Cookie.SameSite = SameSiteMode.Strict;
}).AddOpenIdConnect("oidc", options =>
{
    options.Authority = "https://localhost:5001";
    options.ClientId = "eiromplays_identity_spa";
    options.ClientSecret = "secret";
    options.ResponseType = "code";
    options.ResponseMode = "query";

    options.GetClaimsFromUserInfoEndpoint = true;
    options.MapInboundClaims = false;
    options.SaveTokens = true;

    options.Scope.Clear();
    options.Scope.Add("openid");
    options.Scope.Add("profile");
    options.Scope.Add("api");
    options.Scope.Add("offline_access");

    options.TokenValidationParameters = new TokenValidationParameters
    {
        NameClaimType = "name",
        RoleClaimType = "role"
    };
});

var app = builder.Build();

app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseBff();
app.UseAuthorization();
app.MapBffManagementEndpoints();

app.MapControllers()
    .RequireAuthorization()
    .AsBffApiEndpoint();

// app.MapRemoteBffApiEndpoint("/todos", "https://localhost:5020/todos")
//     .RequireAccessToken(Duende.Bff.TokenType.User);

app.MapFallbackToFile("index.html"); ;

app.Run();