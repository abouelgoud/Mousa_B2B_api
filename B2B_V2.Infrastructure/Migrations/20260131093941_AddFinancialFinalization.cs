using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace B2B_V2.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFinancialFinalization : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "FinalizedAt",
                table: "FinancialRecords",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsFinalized",
                table: "FinancialRecords",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FinalizedAt",
                table: "FinancialRecords");

            migrationBuilder.DropColumn(
                name: "IsFinalized",
                table: "FinancialRecords");
        }
    }
}
