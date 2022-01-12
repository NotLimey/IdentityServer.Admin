// Copyright (c) Duende Software. All rights reserved.
// See LICENSE in the project root for license information.

// Original file: https://github.com/DuendeSoftware/Samples/blob/main/IdentityServer/v6/Quickstarts
// Modified by Eirik Sj�l�kken

using Eiromplays.IdentityServer.Application.Common.Security;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;

namespace Eiromplays.IdentityServer.Quickstart.Diagnostics;

[SecurityHeaders]
[Microsoft.AspNetCore.Authorization.Authorize]
public class DiagnosticsController : Controller
{
    public async Task<IActionResult> Index()
    {
        var localAddresses = new[] { "127.0.0.1", "::1", HttpContext.Connection.LocalIpAddress?.ToString() };
        if (!localAddresses.Contains(HttpContext.Connection.RemoteIpAddress?.ToString()))
        {
            return NotFound();
        }

        var model = new DiagnosticsViewModel(await HttpContext.AuthenticateAsync());
        return View(model);
    }
}