﻿using Eiromplays.IdentityServer.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Eiromplays.IdentityServer.Application.Common.Interfaces
{
    public interface IPermissionDbContext
    {
        DbSet<Permission> Permissions { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}
