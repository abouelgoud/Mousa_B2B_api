using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace B2B_V2.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBranchGeofencing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "BranchId",
                table: "Requests",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Latitude",
                table: "ProviderBranches",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Longitude",
                table: "ProviderBranches",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Requests_BranchId",
                table: "Requests",
                column: "BranchId");

            migrationBuilder.AddForeignKey(
                name: "FK_Requests_ProviderBranches_BranchId",
                table: "Requests",
                column: "BranchId",
                principalTable: "ProviderBranches",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Requests_ProviderBranches_BranchId",
                table: "Requests");

            migrationBuilder.DropIndex(
                name: "IX_Requests_BranchId",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "BranchId",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "ProviderBranches");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "ProviderBranches");
        }
    }
}
